const {Writable} = require("node:stream");
const fs = require("node:fs");
const fsasync = require('node:fs/promises')
module.exports = class FileWriteStream extends Writable {
  constructor({
    highWaterMark,
    fileName,
    position,
    append
  }) {


    super({
      highWaterMark
    });

    this.fileName = fileName;
    this.bytesRead = 0
    this.fd = null;
    this.chunks = [];
    this.chunksSize = 0;
    this.writesCount = 0;
    this.postion = position;
    this.append = append
  }

  async fileSize() {
    // Open the file and get its size  
    try {
      const addContent = await fsasync.open(this.fileName, "r");
      this.size = (await addContent.stat()).size;
      await addContent.close();
    } catch (error) {
      console.log(error)
    } finally {
      console.log('File Size: ', this.size)
      return this.size

    }

  }

  //This will run after the contructor, and it will put off calling all the other
  //methods until we call the callback function
  _construct(callback) {
    fs.open(this.fileName, "w", (err, fd) => {
      console.time('writeMany')
      if (err) {
        //so if we call the callback with an argument, it means that we have an error
        //and we should not proceed
        callback(err);
      } else {
        //The reference to the file is stored in fd
        this.fd = fd;
        try {
          this.fileSize()
        } catch (error) {
          console.log(error)
        } finally {
          console.log('File Size: ', this.size)
          callback();
        }

      }
    });
  }

  _write(chunk, encoding, callback) {

    console.log(`POSITION TO WRITE: ${this.postion}`)

    // do our write operation...
    this.chunks.push(chunk);
    this.chunksSize += chunk.length;
    this.bytesRead += this.chunksSize

    if (this.chunksSize >= this.writableHighWaterMark) {
      console.log("Bytes read: " + this.bytesRead)
      console.log('Write Position: ', this.postion)
      fs.write(
        this.fd,
        Buffer.concat(this.chunks),
        0,
        Buffer.concat(this.chunks).length,
        0, (error) => {
          if (error) {
            return callback(error);
          }
          this.chunks = [];
          this.chunksSize = 0;
          this.writesCount += 1;
          callback()
        });
    } else {
      callback()
    }
  }

  _final(callback) {
    fs.write(this.fd, Buffer.concat(this.chunks), 0, Buffer.concat(this.chunks).length, this.postion, (error) => {
      if (error) {
        return callback(error);
      }
    })
    console.log("last chunk " + this.chunks.toString('utf-8'))
    this.bytesRead += this.chunks.length
    console.log('final')
    console.log('Size Read: ' + this.bytesRead)
    this.chunks = [];
    callback()
    this._destroy()

  }

  _destroy(error) {
    console.log("Number of writes: ", this.writesCount);
    if (this.fd) {
      fs.close(this.fd, (err) => {
        console.timeEnd('writeMany')
        //explicitly instructs the operating system to flush all buffered data for the given file to the disk. Safety Reasons...
        // fd.fsync()
        return console.log('Write File Closed')
      });

    }

  }

};