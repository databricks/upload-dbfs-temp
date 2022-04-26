# upload-dbfs-temp v0

# Overview
Given a file on the local filesystem, this Action uploads the file to a temporary path in 
DBFS (docs:
[AWS](https://docs.databricks.com/data/databricks-file-system.html) |
[Azure](https://docs.microsoft.com/en-us/azure/databricks/data/databricks-file-system) |
[GCP](https://docs.gcp.databricks.com/data/databricks-file-system.html)), returns the
path of the DBFS tempfile as an Action output, and cleans up the DBFS tempfile at the end of the current
GitHub Workflow job.

You can use this Action in combination with [databricks/run-databricks-notebook](https://github.com/databricks/run-databricks-notebook) to 
trigger code execution on Databricks for CI (e.g. on pull requests) or CD (e.g. on pushes to master).
  
# Prerequisites
To use this Action, you need a Databricks REST API token to upload your file to DBFS and delete it at the end of 
workflow job execution. We recommend that you store the token in [GitHub Actions secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
to pass it into your GitHub Workflow. The following section lists recommended approaches for token creation by cloud.

## AWS
For security reasons, we recommend creating and using a Databricks service principal API token. You can
[create a service principal](https://docs.databricks.com/dev-tools/api/latest/scim/scim-sp.html#create-service-principal),
grant the Service Principal
[token usage permissions](https://docs.microsoft.com/en-us/azure/databricks/administration-guide/access-control/tokens#control-who-can-use-or-create-tokens),
and [generate an API token](https://docs.databricks.com/dev-tools/api/latest/token-management.html#operation/create-obo-token) on its behalf.

## Azure
For security reasons, we recommend using a Databricks service principal AAD token.

### Create an Azure Service Principal
You can:
* Install the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
* Run `az login` to authenticate with Azure
* Run `az ad sp create-for-rbac -n <your-service-principal-name> --sdk-auth --scopes /subscriptions/<azure-subscription-id>/resourceGroups/<resource-group-name> --sdk-auth --role contributor`,
  specifying the subscription and resource group of your Azure Databricks workspace, to create a service principal and client secret.
  Store the resulting JSON output as a GitHub Actions secret named e.g. `AZURE_CREDENTIALS`
* Get the application id of your new service principal by running `az ad sp show --id <clientId from previous command output>`, using
  the `clientId` field from the JSON output of the previous step.
* [Add your service principal](https://docs.microsoft.com/en-us/azure/databricks/dev-tools/api/latest/scim/scim-sp#add-service-principal) to your workspace. Use the
  `appId` output field of the previous step as the `applicationId` of the service principal in the `add-service-principal` payload.
* **Note**: The generated Azure token has a default life span of **60 minutes**.
  If you expect your Databricks notebook to take longer than 60 minutes to finish executing, then you must create a [token lifetime policy](https://docs.microsoft.com/en-us/azure/active-directory/develop/configure-token-lifetimes)
  and attach it to your service principal.

### Use the Service Principal in your GitHub Workflow
* Add the following steps to the start of your GitHub workflow.
  This will create a new AAD token and save its value in the `DATABRICKS_TOKEN`
  environment variable for use in subsequent steps.

  ```yaml
  - name: Log into Azure
    uses: Azure/login@v1
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}
  - name: Generate and save AAD token
    id: generate-token
    run: |
      echo "DATABRICKS_TOKEN=$(az account get-access-token \
      --resource=2ff814a6-3304-4ab8-85cb-cd0e6f879c1d \
      --query accessToken -o tsv)" >> $GITHUB_ENV
  ```

## GCP
For security reasons, we recommend inviting a service user to your Databricks workspace and using their API token.
You can invite a [service user to your workspace](https://docs.gcp.databricks.com/administration-guide/users-groups/users.html#add-a-user),
log into the workspace as the service user, and [create a personal access token](https://docs.gcp.databricks.com/dev-tools/api/latest/authentication.html) 
to pass into your GitHub Workflow.

# Usage

See [action.yml](action.yml) for the latest interface and docs.

### Run a notebook using library dependencies in the current repo
In the workflow below, we build Python code in the current repo into a wheel, use ``upload-dbfs-temp`` to upload it to
a tempfile in DBFS, then use the [databricks/run-notebook](https://github.com/databricks/run-notebook) Action to run a
notebook that depends on the wheel.

```yaml
name: Upload Python Wheel to DBFS then run notebook using whl.

on:
  pull_request

env:
  DATABRICKS_HOST: https://adb-XXXX.XX.azuredatabricks.net
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checks out the repo
        uses: actions/checkout@v2
      # Obtain an AAD token and use it to upload to Databricks.
      # Note: If running on AWS or GCP, you can directly pass your service principal
      # token via the databricks-host input instead
      - name: Log into Azure
        uses: Azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      # Get an AAD token for the service principal,
      # and store it in the DATABRICKS_TOKEN environment variable for use in subsequent steps.
      # We set the `resource` parameter to the programmatic ID for Azure Databricks.
      # See https://docs.microsoft.com/en-us/azure/databricks/dev-tools/api/latest/aad/service-prin-aad-token#--get-an-azure-ad-access-token for details.
      - name: Generate and save AAD token
        id: generate-token
        run: |
          echo "DATABRICKS_TOKEN=$(az account get-access-token \
          --resource=2ff814a6-3304-4ab8-85cb-cd0e6f879c1d \
          --query accessToken -o tsv)" >> $GITHUB_ENV
      - name: Setup python
        uses: actions/setup-python@v2
      - name: Build wheel
        run:
          python setup.py bdist_wheel
      - name: Upload Wheel
        uses: databricks/upload-dbfs-temp@v0
        id: upload_wheel
        with:
          local-path: dist/my-project.whl
      - name: Trigger model training notebook from PR branch
        uses: databricks/run-databricks-notebook@v0
        with:
          local-notebook-path: notebooks/deployments/MainNotebook
          # Install the wheel built in the previous step as a library
          # on the cluster used to run our notebook
          libraries-json: >
            [
              { "whl": "${{ steps.upload_wheel.outputs.dbfs-file-path }}" }
            ]
          # The cluster JSON below is for Azure Databricks. On AWS and GCP, set
          # node_type_id to an appropriate node type, e.g. "i3.xlarge" for
          # AWS or "n1-highmem-4" for GCP
          new-cluster-json: >
            {
              "num_workers": 1,
              "spark_version": "10.4.x-scala2.12",
              "node_type_id": "Standard_D3_v2"
            }
          # Grant all users view permission on the notebook results, so that they can
          # see the result of our CI notebook
          access-control-list-json: >
            [
              {
                "group_name": "users",
                "permission_level": "CAN_VIEW"
              }
            ]
```

# License

The scripts and documentation in this project are released under the [Apache License, Version 2.0](LICENSE).
