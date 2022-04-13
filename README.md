# upload-dbfs-temp V0

# Overview
Given a file on the local filesystem, this Action uploads the file to a temporary path in 
DBFS (docs:
[AWS](https://docs.databricks.com/data/databricks-file-system.html) |
[Azure](https://docs.microsoft.com/en-us/azure/databricks/data/databricks-file-system) |
[GCP](https://docs.gcp.databricks.com/data/databricks-file-system.html)), returns the
path of the DBFS tempfile as an Action output, and cleans up the DBFS tempfile at the end of the current
GitHub Workflow job.

You can use this Action in combination with [databricks/run-notebook](https://github.com/databricks/run-notebook) to 
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
[//]: # (TODO: Add back steps to create an Azure Service Principal.)
You can create a Personal Access Token from the `User Settings` page in the
Databricks workspace and pass it to the action as an input.
The generated token can be stored as a GitHub Actions secret named e.g. `MY_DATABRICKS_PERSONAL_TOKEN`.

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
  DATABRICKS_TOKEN: ${{ secrets.MY_DATABRICKS_PERSONAL_TOKEN }}
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checks out the repo
        uses: actions/checkout@v2
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
        uses: databricks/run-notebook@v0
        with:
          local-notebook-path: notebooks/deployments/MainNotebook
          # Install the wheel built in the previous step as a library
          # on the cluster used to run our notebook
          libraries-json: >
            [
              { "whl": "${{ steps.upload_wheel.outputs.dbfs-file-path }}" },
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
          # Grant all users view permission on the notebook results
          access-control-list-json: >
            [
              {
                "users": "Can View",
              }
            ]
```

# License

The scripts and documentation in this project are released under the [Apache License, Version 2.0](LICENSE).
