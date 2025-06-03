class NotFoundError extends Error{
  constructor(message){
    super(message)
    this.name = 'NotFoundError';
  }
}

function success(res,message,data={},code=200){
  res.status(code).json({
    status:true,
    message,
    data
  })
}

function failure(res,error){
  if(error.name ==='SequelizeValidationError'){
    const errors = error.errors.map((e) => e.message);
    res.status(400).json({
      status:false,
      message:'Validation error',
      errors
    })

    if(error.name==='NotFoundError'){
      res.status(404).json({
        status:false,
        message:[error.message]
      })
    }

    res.status(500).json({
      status:false,
      message:'Internal server error',
      error:[error.message]
    })
  }
}

module.exports = {
  NotFoundError, 
  success,
  failure,
}