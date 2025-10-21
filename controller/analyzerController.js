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
    console.log( typeof palindrome)
    //word count
    const trimString = value.trim()
    const words = trimString.split(/\s+/)
    const wordsLength = parseInt(words.length)
    console.log(typeof wordsLength)
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
    console.log(typeof uniqueChaLength)
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
    return res.status(200).json(response)
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
    const minLength = Number(min_length)
    const maxLength = Number(max_length)
    const wordCount = Number(word_count)
    const containsChar = typeof contains_character === 'string' ? contains_character.toLowerCase() : null


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
