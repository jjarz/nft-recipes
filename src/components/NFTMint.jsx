import React, { useState, useEffect } from "react";
import {
  useMoralis,
  useWeb3ExecuteFunction,
  useMoralisFile,
} from "react-moralis";
import { abi } from "../contracts/contractInfo.json";
import { Card, Tooltip, Skeleton, Image, Modal, Form } from "antd";
import NFTMintForm from "./NFTMintForm";
import { RiseOutlined } from "@ant-design/icons";
// import { useVerifyMetadata } from "hooks/useVerifyMetadata";
import axios from "axios";

// address, api key from .env
// * these need to be replaced when app goes to prod *
const ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const API_KEY = process.env.REACT_APP_NFT_PORT_API_KEY;

/*
 * Displays and handles form to mint an NFT to the address of the authenticated user
 */
function NFTMint() {
  // will use this eventually to set properties on the NFT (like title)
  // const [nftTitle, setNFTTitle] = useState(null);
  const { account } = useMoralis();
  const { saveFile } = useMoralisFile();
  const [baseRecipes, setBaseRecipes] = useState([]);
  const [visible, setVisibility] = useState(false);
  const [nftToRemix, setNftToRemix] = useState(null);
  const contractProcessor = useWeb3ExecuteFunction();
  const [imageFile, setImageFile] = useState();
  // const { verifyMetadata } = useVerifyMetadata();
  const { Meta } = Card;
  const [form] = Form.useForm();

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

  // call only once
  useEffect(() => {
    const options = {
      method: "GET",
      url: `https://api.nftport.xyz/v0/nfts/${ADDRESS}`,
      params: {
        chain: "rinkeby",
        include: "all",
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: API_KEY,
      },
    };

    axios
      .request(options)
      .then((response) => {
        setBaseRecipes(response.data.nfts);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, []);

  const handleRemixClick = (nft) => {
    setNftToRemix(nft);
    form.resetFields();
    setVisibility(true);
  };

  // address _to,
  // uint256 _tokenId,
  // string memory tokenURI_
  async function mintNFT(tokenURI) {
    const options = {
      functionName: "mint",
      abi,
      contractAddress: ADDRESS,
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
      parentId: nftToRemix ? nftToRemix.metadata_url : "base",
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

  function clearForm() {
    form.resetFields();
    setNftToRemix(null);
    setVisibility(false);
  }

  console.log("Base NFTs", baseRecipes);
  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <h1>Explore the Base Recipes</h1>
      <Skeleton loading={!baseRecipes}>
        <div style={styles.NFTs}>
          {baseRecipes &&
            baseRecipes
              .filter((nft) => nft.file_url)
              .map((nft, index) => {
                //Verify Metadata
                // nft = verifyMetadata(nft);
                return (
                  <Card
                    hoverable
                    actions={[
                      <Tooltip title="Remix this Recipe">
                        <RiseOutlined onClick={() => handleRemixClick(nft)} />
                      </Tooltip>,
                    ]}
                    style={{ width: 240, border: "2px solid #e7eaf3" }}
                    cover={
                      <Image
                        preview={false}
                        src={nft?.file_url || "error"}
                        fallback="data:image/png;base64,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"
                        alt=""
                        style={{ height: "500px" }}
                      />
                    }
                    key={index}
                  >
                    <Meta title={nft.metadata?.name} />
                  </Card>
                );
              })}
        </div>
      </Skeleton>
      <Modal
        title={`Remix ${nftToRemix?.metadata?.name || "NFT"}`}
        visible={visible}
        onCancel={() => clearForm()}
        onOk={() => console.log(nftToRemix)}
        okText="Remix"
      >
        <NFTMintForm
          onUpload={uploadAction}
          onSubmit={submitForm}
          nft={nftToRemix}
          form={form}
        />
      </Modal>
      <h1>Mint a new NFT</h1>
      <div>
        <div>
          <NFTMintForm onUpload={uploadAction} onSubmit={submitForm} nft={{}} />
        </div>
      </div>
    </div>
  );
}

export default NFTMint;
