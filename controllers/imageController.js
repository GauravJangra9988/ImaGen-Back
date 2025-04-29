import axios from "axios"
import FormData from "form-data"
import userModel from "../models/userModel.js"

export const generateImage = async(req,res)=>{
    try{

        const {userId, prompt} = req.body

        const user = await userModel.findById(userId)

        if(!user || !prompt){
            return res.json({success: false, message: 'Missing Details'})
        }

        if(user.creditBalance === 0 || user.creditBalance < 0){
            return res.json({success: false, message: 'No Credit Balance'})
        }

        const formData = new FormData()
        formData.append('prompt', prompt)

        const {data} = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {headers: {
            'x-api-key': process.env.API,
          },responseType: 'arraybuffer'})

        const base64Image = Buffer.from(data,'binary').toString('base64')
        const resultImage = `data:image/png;base64,${base64Image}`

        await userModel.findByIdAndUpdate(user._id, {creditBalance: user.creditBalance -1})
        res.json({success: true, message: "Image genrated", creditBalance: user.creditBalance, resultImage})


    } catch(err){
        console.log(err.message)
        res.json({success: false, message: err.message})
    }
}

