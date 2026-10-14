import axios from "axios"


const scanPrescription = async (file, token) => {
    const formData = new FormData()
    formData.append("prescription", file)

    const options = {
        headers: {
            authorization: `Bearer ${token}`
        }
    }

    const response = await axios.post("/api/ai/prescription", formData, options)
    return response.data
}


const aiService = { scanPrescription }


export default aiService
