# CatcherUpdater

Update a field CONTENTdm using the Catcher SOAP API + values defined in a Google Sheet.

## Requirements

- Node.js (written for Node 16.16.0; other versions may require changes)
- Mongo-compatible database
- Google Sheets

## Getting started

In the `config` folder, copy `default-sample.json` to `default.json`. Update `default.json` to add default setup values, Catcher server & authentication information, and Mongo-compabible database connection information.

## Use

- Start the script by running `node index`
- Web interface will be available on `http://localhost:3000`
- Required Fields:
  - Google Sheet Id: this is _part_ of the GSheet Url. If the sheet URL is https://docs.google.com/spreadsheets/d/xyz-123/edit the sheetId is **xyz-123**
    - Note: the Google Sheet must be viewable by anyone with the URL. This tool does not make provisions for logging in to access the sheet
  - CdM Field Name: the CONTENTdm "slug" for the field you want to edit, e.g. `identi` for the identifier.
  - Field Label in Sheet: This is the label/header in the the Google sheet that corresponds to the data you want to update in CONTENTdm. Make sure you use the exact spacing, capitalization, etc. That's how the process will find the data you're editing. E.g. `Identifier`
  - CdM Collection Alias: the collection alias, starting with a forward slash, e.g. `/MyCollection`
- Optional Fields
  - Batch Name: You can name each job/batch so it is easy to find again in the logs
  - First CdM Number: tell the process to ignore items with CONTENTdm Numbers lower than this
  - Last CdM Number: tell the process to ignore items with CONTENTdm Numbers higher than this
  - First Sheet Row: tell the process to ignore items with a lower numbered row in the Google Sheet
  - Last Sheet Row: tell the process to ignore items with a higher numbered row in the Google Sheet

### Important Note

After running updates, you must re-index the collection in the CONTENTdm Administration website before changes will appear in the collection. Items changed will be locked until re-indexing. Any attempt to re-update the same items will result in failures unless you manually unlock the item in the CONTENTdm Administration website.

## Logs

Two kinds of logs are created:

- Batch logs -- one entry per batch/job. Each time you submit the form, it will create a new batchId, and one or more transactions will be associated with that batch. The batch will be logged along with the number of successes and failed updates in the batch
  - view batch logs at /logs
- Transaction logs -- each item you update (or attempt to update) will create a log of that transaction, the edit action attempted, and whether or not it succeeded.
  - search keywords in the navbar to find transactions matching a particular CONTENTdm Number, field name, or update value
