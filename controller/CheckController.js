import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const sendsms = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    const apiKey =
      "1QWdPrpbvGnWffKeSecp6864JRr8Bjbc4QhykfCYl602a4uC1YhDA7aM3bvpuTs2";
    const template = "1207161834199284262";

    const headers = {
      "X-Authorization":
        "1QWdPrpbvGnWffKeSecp6864JRr8Bjbc4QhykfCYl602a4uC1YhDA7aM3bvpuTs2",
    };

    const message = `Dear Customer, Your verification OTP code is ${12345}. Regards Vridhi Stores`;

    const apiUrl = `https://www.pingsms.in/api/sendsms?key=${encodeURIComponent(
      apiKey
    )}&sender=VRIDST&mobile=${encodeURIComponent(
      mobile
    )}&language=1&product=1&message=${encodeURIComponent(
      message
    )}&template=${template}`;

    const response = await axios.get(apiUrl, { headers });

    console.log(response);
    res.status(200).json({
      success: true,
      message: "OTP Sent Succefully",
    });
  } catch (error) {
    console.error("Error sending SMS:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to send SMS",
      error: error.message,
    });
  }
};

export default sendsms;
