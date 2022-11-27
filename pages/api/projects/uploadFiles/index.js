import { connectToDatabase } from "../../../../lib/mongoconnect";
import nextConnect from "next-connect";
import multer from "multer";

// Returns a Multer instance that provides several methods for generating
// middleware that process files uploaded in multipart/form-data format.
const upload = multer({
  storage: multer.diskStorage({
    destination: `./public/uploads/`,

    filename: (req, file, cb) => {
      cb(null, file.originalname);
      // console.log(file)
    },
  }),
});

const apiRoute = nextConnect({
  // Handle any other HTTP method
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

// Returns middleware that processes multiple files sharing the same field name.
const uploadMiddleware = upload.array("upldFiles");

// Adds the middleware to Next-Connect
apiRoute.use(uploadMiddleware);

// Process a POST request
apiRoute.post(async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    console.log(req.body)
    const projectList = await db.collection("projectsfiles").insertOne({
      test: "successnew",
      projectid: req.body.projectid,
      name: req.body.name,
      email: req.body.email,      
      
    });
    res.status(200).json({ data: projectList });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "some error occured" });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
