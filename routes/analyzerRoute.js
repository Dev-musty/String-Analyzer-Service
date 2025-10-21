import express from 'express'
import { analyzeString, filterStrings, getString } from '../controller/analyzerController.js'
const router = express.Router()

router.post('/strings', analyzeString)
//router.get('/allStrings',getAllStrings)
router.get('/strings/:string_value', getString)
router.get('/strings', filterStrings)
// router.get('/strings/filter-by-natural-language')


export default router
