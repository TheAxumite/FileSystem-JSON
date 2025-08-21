  const fs = require("node:fs");
  const fsasync = require('fs/promises');
  const pathlist = './users';
  const FileWriteStream = require('./FileWriteStream')

  const initializeData = () => {
      this.query = fs.readFileSync(pathlist, "utf8")
      this.list = undefined
      if (this.query.trim()) { // If there's any content in the file
          this.list = JSON.parse(this.query); // Parse the content into an array
      }
      return this.list
  }
  //Loads data into memory
  const data = initializeData();
  const buffer = Buffer.from(JSON.stringify(data), 'utf-8')
  //NOTE when filtering for items in the database. Also, save the 
  const filter = (searchKeys, matchingParameter) => {
      let result = data;
      console.log('searchkeys', searchKeys)
      for (const key in searchKeys) {
          result = result.filter(row => row[searchKeys[key]] == matchingParameter[searchKeys[key]])
          console.log('RESULT: ', result)
      }
      console.log('LAST RUN Result: ', result)
      return result
  }
  const returnstruct = (data, struct, size = data.length) => {
      let returnfield = []
      for (const row in data) {
          let keyvaluepair = {}
          for (const key in struct) {
              keyvaluepair[`${struct[key]}`] = data[row][struct[key]]
          }
          returnfield.push(keyvaluepair)
      }
      return returnfield
  }

  const query = (matchingParameter, returnstructure) => {
      //Returns an array
      const searchKeys = Object.keys(matchingParameter)
      const filteredData = filter(searchKeys, matchingParameter)
      return returnstruct(filteredData, returnstructure)

  }
  const fileSize = async () => {
      // Open the file and get its size  
      try {
          const addContent = await fsasync.open(pathlist, "r");
          var size = (await addContent.stat()).size;
          await addContent.close();
      } catch (error) {
          console.log(error)
      } finally {
          console.log('File Size: ', size)
          return size
      }

  }

  const append = (newdata) => {
      data.push(newdata)
  }

  //NOTE: The partdata should be an array of strings where each unit is key value pair
  //Then each key value pair should looped through and changed in the database as it is found
  //
  const find = (partdata) => {
      let keylength = 2;
      const keyLength = partdata.forEach(element => {
          let elements = Object.keys(element)
          elements.push(Object.values(element))
          console.log('Keys: ', elements)
          keylength += elements.reduce((prev, curr) => prev + curr.length, 0)
          this.values = Object.values(element)
      })
      //console.log('Key: ', Object.keys(element), '\n', "Value: ", values, '\n')
      console.log("Size: ", keylength)
      console.log('Search Parameter for Return Index: ', JSON.stringify(partdata).slice(1, partdata.length - 1))
      console.log('DATA: ', JSON.stringify(data))
      this.string = JSON.stringify(partdata)
      //return buffer.indexOf(this.string.slice(1,this.string.length-1), 'utf-8')
  }


  const update = async (position, data, append) => {
      try {
          console.log(`Attempting to open file ${pathList}`)

          var fileHandle = new FileWriteStream({
              fileName: pathlist,
              writableHighWaterMark: 0,
              position: position,
              append: append
          })
      } catch (error) {
          console.log(error)
          return error
      } finally {
          if (fileHandle != undefined) {
              fileHandle.write(data, () => {
                  console.log('written')
              })
              fileHandle.end()

          }
      }
  }

  fileSize()
  console.log("Executed Database: ", query({
      username: "merit.sky",
      password: "string"
  }, ['username', 'id']))

  console.log(find([{
      username: 'merit.sky',
      id: 1
  }]))

  console.log('TEST',
    [{
      username: 'merit.sky',
      id: 1
  }].forEach(element => console.log('Real',JSON.stringify(element).trim().length))
  )