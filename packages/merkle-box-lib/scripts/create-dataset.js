/**
 * Usage:
 *
 *   node scripts/create-dataset.js recipients.json > dataset.json
 */

/* eslint-disable no-console */

'use strict'

const createMerkleBox = require('..')
const path = require('path')

const [recipientsUri] = process.argv.slice(2)

const recipients = require(path.join(process.cwd(), recipientsUri))
const dataset = createMerkleBox.util.calcDataset(recipients)
console.log(JSON.stringify(dataset, null, 2))
