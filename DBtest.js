  const fs = require("node:fs");
  const fsasync = require('fs/promises');
  const pathlist = './users';
  const FileWriteStream = require('./FileWriteStream');
  const {
      json
  } = require("node:stream/consumers");


  //Loads data into memory
  const initializeData = () => {
      try {
          this.query = fs.readFileSync(pathlist, "utf8")
          this.list = undefined
          if (this.query.trim()) { // If there's any content in the file
              this.list = JSON.parse(this.query); // Parse the content into an array
          }

          return this.list
      } catch (error) {
          console.log('File Loading Error: ', error)
      }
  }

  const data = initializeData();
  const buffer = Buffer.from(JSON.stringify(data))

  const findItemLocation = (data) => {
      let location = []
      data.forEach(element => {
          location.push([element, buffer.indexOf(Buffer.from(element))])
      });
      return location
  }

  const filter = (searchKeys, matchingParameter) => {
      let result = data;
      console.log('searchkeys', searchKeys)
      console.log('Matching Parameters: ', matchingParameter)
      for (const key in searchKeys) {
          result = result.filter(row => row[searchKeys[key]] == matchingParameter[searchKeys[key]])
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

  const returnAsList = (data) => {
      let list = []
      for (let d = 0; d < data.length; d++) {
          let keys = Object.keys(data[d])
          let values = Object.values(data[d])
          for (let i = 0; i < keys.length; i++) {
              if ((typeof values[i]) == "string") {
                  list.push(`"${keys[i]}":"${values[i]}"`)
              } else {
                  list.push(`"${keys[i]}":${values[i]}`)
              }

          }
      }
      console.log('Return As List: ', list)
      return list
  }

  const query = (matchingParameter, returnstructure, update) => {
      //Returns an array
      const searchKeys = Object.keys(matchingParameter)
      const filteredData = filter(searchKeys, matchingParameter)
      const itemLocatioin = findItemLocation(returnAsList(filteredData))
      if (update) {
          return {
              'itemlocation': itemLocatioin,
              'result': returnstruct(filteredData, returnstructure)
          }
      }
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

  const append = (record) => {
      if (query(record).length > 0) {
          return console.error('Error: Unable to append. Duplicate Record Found.');
      } else {
          data.push(record)
          update(datalength(data), record)
          console.log('Appended Data: ', data)
      }
  }


  //NOTE: The partdata should be an array of strings where each unit is key value pair
  //Then each key value pair should looped through and changed in the database as it is found
  const datalength = (data) => {
      const keyLength = data.reduce((accumulator, element, index, array) => {
          return accumulator + JSON.stringify(element).trim().length; // Accumulator is updated
      }, 0);
  }

  const update = (position, data) => {
      fileSize().then((size) => {
          try {
              console.log(`Attempting to open file ${pathlist}`)
              var fileHandle = new FileWriteStream({
                  fileName: pathlist,
                  position: size - 1
              })
          } catch (error) {
              console.log(error)
              return error
          } finally {
              if (fileHandle != undefined) {
                  fileHandle.write(Buffer.from(`,${JSON.stringify(data)}]`), () => {
                      console.log('written')
                  })
                  fileHandle.end()

              }
          }
      })
  }

  const queryresult = query({
      username: "liam23",
      password: "string"
  }, ['username', 'password'], true)

   const appendresult = append({
        id: 12,
        name: "Mesfin Deb",
        username: "mesfin.deb",
        password: "TODO"
    })
    console.log('Append Result: ', appendresult) 
  console.log("Executed Database: ", queryresult)


  let test = Buffer.from("HELLO")
  let slice1 = test.slice(0, 2);
  let newbuffer = Buffer.from("Hell")
  let final = Buffer.concat([slice1, newbuffer, test])

  console.log(final.toString())