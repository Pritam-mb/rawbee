import multer from "multer"
// multer in express basically used to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp') //multer basically stores the files locally here
  },
  filename: function (req, file, cb) {
  //  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  }
})

export const upload = multer({ 
  storage
    
 })