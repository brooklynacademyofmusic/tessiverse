# 🪐✨ tessiverse 🪐✨

tessiverse is a set of Azure functions that work with [tq](http://github.com/skysyzygy/tq) as a 
gateway to communicate with a Tessitura database. 

## Environment Variables
**The Azure environment will need the following environment variables**

### Identity

* `AZURE_CLIENT_ID`: a service principal / app ID
* `AZURE_CLIENT_SECRET`: a corresponding secret for the AZURE_CLIENT_ID
* `AZURE_TENANT_ID`: the tenant under which the app is installed

### Storage 
* `AZURE_KEY_VAULT`: the Azure key vault where tessiverse user configuration is stored
* `TQ_KEY_VAULT`: the Azure key vault where tq authentication is stored (could be the same as `AZURE_KEY_VAULT`)

### Tessitura
* `TQ_ADMIN_LOGIN`: an API login to provide some basic functionality, as a string in the following format: `{username}|{usergroup}|{location}`. The authentication details will then need to be added to `TQ_KEY_VAULT`
* `MACHINE_LOCATION`: a location for auditing purposes (configured in `TX_MACHINE_LOCATION`)
* `PUBLIC_SERVERS`: the live/test environments to make available as a JSON array:
```json
[ 
    {"label": "Test environment", "value": "https://my-test.api/Tessitura"},
    {"label": "Live environment", "value": "https://my-live.api/Tessitura"}
]
```

## Resource Rights

### Admin user
The `TQ_ADMIN_LOGIN` user will need access to:
| access | resource
|-|-
| read | /CRM/Constituents
| read | /Security/Users  
| read | /ReferenceData/UserGroups

### Plan Step users
Users of the Email to Plan Step tool will need the following rights:

| access | resource
|-|-
| read |  /Finance/Workers
| read | /Finance/Plans
| read | /CRM/ElectronicAddresses
| read | /ReferenceData/StepTypes
| read/write | /Finance/Steps


