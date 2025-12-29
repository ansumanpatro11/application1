class APIResponse{
    constructor(success,data,message="success"){
        this.success=success
        this.data=data
        this.message=message
        this.statuscode=200
    }
}

export {APIResponse}