import BasicInfo from "../models/Basicinfo.model.js";
import AppError from "../utlis/error.utlis.js";
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import Service from "../models/service.model.js";


const addService=async(req,res,next)=>{
try{

  const {serviceName, aboutService,id}=req.body
  
  const basicInfo=await BasicInfo.findById(id)

  if(!basicInfo){
    return next(new AppError("BasicInfo not Found",400))
  }

  const service=await Service.create({
     serviceName,
     aboutService,
     servicePhoto:{
        public_id:"",
        secure_url:""
     },
     basic_info_id:basicInfo._id
  })

  if(req.file){
    const result=await cloudinary.v2.uploader.upload(req.file.path,{
        folder:'lms'
    })
    console.log(result);
    if(result){
        service.servicePhoto.public_id=result.public_id,
        service.servicePhoto.secure_url=result.secure_url
    }
    fs.rm(`uploads/${req.file.filename}`)
    console.log("c-4");
  }

  await service.save()

  res.status(200).json({
    success:true,
    message:"Service Added successfully",
    data:service
  })



}catch(error){
    return next(new AppError())
}
}


export {
    addService
}