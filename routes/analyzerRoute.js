import express from 'express'
import { analyzeString, getString, filterStrings, filterByNaturalLang, delString } from '../controller/analyzerController.js'
const router = express.Router()

router.post('/strings', analyzeString)
router.get('/strings/filter-by-natural-language', filterByNaturalLang)
router.get('/strings', filterStrings)
// router.get('/allStrings', getAllStrings)
router.get('/strings/:string_value', getString)
router.delete('/strings/:string_value', delString)
export default router
