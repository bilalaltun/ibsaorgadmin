import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ keepExtensions: true, multiples: false });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}
