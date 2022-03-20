import { Button } from "@mui/material";
import axios from "axios";
import { createRef } from "react";
import { useUser } from "../contexts/userContext";

function UploadButton() {
  const [user] = useUser();
  const fileInput = createRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    const file = document.getElementById("selectedFile");
    for (let i = 0; i < file.files.length; i++) {
      console.log("a");
      formData.append("image", file.files[i]);
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    axios
      .post("http://localhost:8000/api/files/upload", formData, config)
      .then();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Button variant="contained" component="label">
          Upload File
          <input type="file" id="selectedFile" hidden ref={fileInput} />
        </Button>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}

export default UploadButton;
