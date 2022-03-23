import React, { useState } from "react";
import {
  useMoralis,
  useWeb3ExecuteFunction,
  useMoralisFile,
} from "react-moralis";
import { abi } from "../contracts/contractInfo.json";
import { Input, Button, Form, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px",
    width: "100%",
    gap: "10px",
  },
};

/*
 * interacting with smart contract code: https://youtu.be/7TKqLJd_aYI?t=677
 *
 */
function NFTMint() {
  // will use this eventually to set properties on the NFT (like title)
  // const [nftTitle, setNFTTitle] = useState(null);
  const { account } = useMoralis();
  const { saveFile } = useMoralisFile();
  const contractProcessor = useWeb3ExecuteFunction();
  const [imageFile, setImageFile] = useState();

  // address _to,
  // uint256 _tokenId,
  // string memory tokenURI_
  async function mintNFT(tokenURI) {
    const options = {
      functionName: "mint",
      abi,
      contractAddress: "0x8AF4389D83905BC2908f9c3AC6EC6ce64b97F578",
      params: {
        _to: account,
        tokenURI_: tokenURI,
      },
      onSuccess: (res) => {
        console.log(`Successfully minted nft: ${res}`);
      },
      onError: (error) => {
        console.log(`Error minting NFT: ${error}`);
      },
    };

    await contractProcessor.fetch({
      params: options,
    });
  }

  function notifySuccess() {
    console.log("SUCCESS!");
  }

  /*
   * handle the imageFile state, plus:
   *
   * https://stackoverflow.com/questions/51514757/action-function-is-required-with-antd-upload-control-but-i-dont-need-it
   */
  function uploadAction({ file, onSuccess }) {
    setImageFile(file);
    onSuccess("ok");
  }

  function toBase64(str) {
    return Buffer.from(str).toString("base64");
  }

  /**
   * Take the user input and prepare it to mint the NFT
   *
   * @param {object} values - the values from the html form inputs
   */
  async function submitForm(values) {
    const title = values.title;
    const content = values.content;

    // save the image to IPFS
    const imageIpfsFile = await saveFile(imageFile.name, imageFile, {
      saveIPFS: true,
    });
    const imageURI = imageIpfsFile.ipfs();

    // create the metadata
    const metadata = {
      name: title,
      content: content,
      image: imageURI,
    };

    // save the file with metadata to IPFS
    const nftFile = await saveFile(
      `nft_metadata_${title}`,
      {
        base64: toBase64(JSON.stringify(metadata)),
      },
      {
        saveIPFS: true,
      },
    );

    // with the IPFS address, mint the NFT
    await mintNFT(nftFile.ipfs()).then(notifySuccess);
  }

  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <h1>Mint a new NFT</h1>
      <div style={styles.NFTs}>
        <div>
          <Form name="nft form" onFinish={submitForm} autoComplete="off">
            <Form.Item
              label="Recipe Title"
              name="title"
              rules={[
                { required: true, message: "Please input your recipe title" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Recipe Content"
              name="content"
              rules={[
                { required: true, message: "Please input your recipe content" },
              ]}
            >
              <Input.TextArea rows={6} />
            </Form.Item>

            <Form.Item
              name="imageFile"
              label="Recipe Image"
              valuePropName="imageFile"
            >
              <Upload
                name="logo"
                customRequest={uploadAction}
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Click to upload</Button>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default NFTMint;
