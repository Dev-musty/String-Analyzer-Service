import sha256 from 'crypto-js/sha256.js';

const responseStorage = new Map()
export const analyzeString = async (req,res) => {
  const {value} = req.body
  try {
    if(!value){
      return res.status(400).json({message: ' Invalid request body or missing "value" field'})
    }
    if(typeof value !== 'string'){
      return res.status(422).json({message: 'Invalid data type for "value" (must be string)'})
    }
    if(responseStorage.has(value)){
      return res.status(409).json({message: 'String already exists in the system'})
    }
    // palindrome
    let palindrome = false
    const normalizedString = value.toLowerCase()
    const revString = normalizedString.split(" ").reverse().join(" ")
    if(value === revString){
      palindrome = true
    }
    //word count
    const trimString = value.trim()
    const words = trimString.split(/\s+/)
    const wordsLength = parseInt(words.length)
    // sha256
    const hash = sha256(value).toString();
    // character_frequency_map
    const charMap = {}
    for(const char of value){
      if(char === ' ')
        continue
      charMap[char.toLowerCase()] = (charMap[char] || 0) + 1
    }
    // unique character
    const uniqueCha = Object.keys(charMap).filter((ch) => charMap[ch] === 1 && ch !== ' ')
    const uniqueChaLength = parseInt(uniqueCha.length)
    const response = {
      id: hash,
      value: value,
      properties: {
        length: value.length,
        is_palindrome: palindrome,
        unique_characters: uniqueChaLength,
        word_count: wordsLength,
        sha256_hash: hash,
        character_frequency_map: charMap
      },
      created_at: new Date().toISOString()
    }
    responseStorage.set(value,response)
    return res.status(201).json(response)
  } catch (error) {
    return res.status(500).json({message: `${error.message}`})
  }
}

export const getString = async (req,res) => {
  const {string_value} = req.params
  try {
    if(!string_value){
      return res.status(400).json({message: ' Invalid request body or missing "value" field'})
    }
    if(!responseStorage.has(string_value)){
      return res.status(404).json({message: 'String does not exist in the system'})
    }
    const response = responseStorage.get(string_value)
    return res.status(200).json(response)
  } catch (error) {
      return res.status(500).json({message: `${error.message}`})
  }
}


// export const getAllStrings = async (req,res) => {
//   try {
//     const response = responseStorage.values()
//     if(!response){
//       return res.status(404).json({message: 'no strings found'})
//     }
//     return res.status(200).json([...response])
//   } catch (error) {
//       return res.status(500).json({message: `${error.message}`})
//   }
// }

export const filterStrings = async (req,res) => {
  const {is_palindrome,min_length,max_length,word_count,contains_character} = req.query
  try {
    // convert query parameters to match the datatype of exsiting data
    const isPalindrome = is_palindrome ? (is_palindrome.toLowerCase() === 'true' ? true : (is_palindrome.toLowerCase() === 'false' ? false : null)) : undefined
    const minLength = min_length ? Number(min_length) : undefined
    const maxLength = max_length ? Number(max_length) : undefined
    const wordCount = word_count ? Number(word_count) : undefined
    const containsChar = typeof contains_character === 'string' ? contains_character.toLowerCase() : null

    if(minLength > maxLength || minLength < 0 || maxLength < 0 || wordCount < 0){
      return res.status(422).json({message: 'Query parsed but resulted in conflicting filters'})
    }


    if (isPalindrome === null || !Number.isInteger(minLength) || !Number.isInteger(maxLength) || !Number.isInteger(wordCount) || !containsChar) {
      return res.status(400).json({message: 'Invalid query parameter values or types'})
    }
    const match = []
    for(const data of responseStorage.entries()){
      const palindrome = data[1].properties.is_palindrome === isPalindrome
      const lengthRange = data[1].properties.length >= minLength && data[1].properties.length <= maxLength
      const wordCounts = data[1].properties.word_count === wordCount
      const character = containsChar in data[1].properties.character_frequency_map
      if(palindrome && lengthRange && wordCounts && character){
        match.push(data[1])
      }
    }
    if (match.length === 0) {
      return res.status(400).json({message: 'No match'})
    }
    return res.status(200).json({
          data: match,
          count: match.length,
          filters_applied: {
            is_palindrome: is_palindrome,
            min_length: min_length,
            max_length: max_length,
            word_count: word_count,
            contains_character: contains_character
          }
        })
  } catch (error) {
    return res.status(500).json({message: `${error.message}`})
  }
}

export const filterByNaturalLang = async (req,res) => {
  const {query} = req.query
  try {
    if(!query){
      return res.status(400).json({message: 'Unable to parse natural language query'})
    }
    const match = []
    const filters = {}
    if(query === 'all single word palindromic strings'){
      for(const data of responseStorage.entries()){
        const wordCount = data[1].properties.word_count === 1
        const palindrome = data[1].properties.is_palindrome === true
        if(wordCount && palindrome){
          match.push(data[1])
        }
        filters.word_count = Number(wordCount)
        filters.is_palindrome = palindrome
      }
    }
    if(query === 'strings longer than 10 characters'){
      for(const data of responseStorage.entries()){
        const length = data[1].properties.length >= 11
        if(length){
          match.push(data[1])
        }
        filters.length = data[1].properties.length
      }
    }
    if (query === 'palindromic strings that contain the first vowel') {
      for(const data of responseStorage.entries()){
        const palindrome = data[1].properties.is_palindrome === true
        const vowel = 'a'
        const character = vowel in data[1].properties.character_frequency_map
        if(palindrome && character){
          match.push(data[1])
        }
        filters.is_palindrome = palindrome
        filters.vowel = character
      }
    }
    if (query === 'strings containing the letter z') {
      for(const data of responseStorage.entries()){
        const char = 'z'
        const character = char in data[1].properties.character_frequency_map
        if(character){
          match.push(data[1])
        }
        filters.character = character
      }
    }
    return res.status(200).json({
      data: match,
      count: match.length,
      interpreted_query:{
        original: query,
        parsed_filters: {
          ...filters
        }
      }
    })
  } catch (error) {
    return res.status(500).json({message: `${error.message}`})
  }
}

export const delString = async (req,res) => {
  const {string_value} = req.params
  try {
    if(!string_value){
      return res.status(400).json({message: ' Invalid request body or missing "value" field'})
    }
    if(!responseStorage.has(string_value)){
      return res.status(404).json({message: 'String does not exist in the system'})
    }
    const response = responseStorage.delete(string_value)
    return res.status(204).json(response)
  } catch (error) {
      return res.status(500).json({message: `${error.message}`})
  }
}
