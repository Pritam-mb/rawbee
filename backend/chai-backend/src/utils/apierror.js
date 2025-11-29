class apierror extends Error { // Error is a built-in class in JS which we are extending for our custom error 
    constructor(
        message ="something went wrong",
        statusCode,
        errors =[],
        stack =""
    ){
        super(message) // super is used to call the constructor of the parent class
        this.statusCode = statusCode
        this.errors = errors
        this.stack = stack
        this.success = false // since its an error
        this.data = null
        
        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export default apierror