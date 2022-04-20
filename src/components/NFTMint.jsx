import React, { useState, useEffect } from "react";
import {
  useMoralis,
  useWeb3ExecuteFunction,
  useMoralisFile,
} from "react-moralis";
import { abi } from "../contracts/contractInfo.json";
import { Tooltip, Skeleton, Modal, Form, Tabs, Drawer, Button } from "antd";
import { RiseOutlined } from "@ant-design/icons";
import NFTMintForm from "./NFTMintForm";
import axios from "axios";
import RecipeCard from "./RecipeCard";

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
  const [remixMap, setRemixMap] = useState(new Map());
  const [modalVisible, setModalVisibility] = useState(false);
  const [drawerVisibile, setDrawerVisibility] = useState(false);
  const [nftToRemix, setNftToRemix] = useState(null);
  const contractProcessor = useWeb3ExecuteFunction();
  const [imageFile, setImageFile] = useState();
  // const { verifyMetadata } = useVerifyMetadata();
  const { TabPane } = Tabs;
  const [form] = Form.useForm();
  const BASE = "BASE_RECIPE";

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
   * Build out a map of the base NFTs with all of their remixes
   */
  function buildRemixMap(allNFTs, baseNFTs) {
    const remixMapTemp = new Map();
    console.log(allNFTs);

    // for each base nft
    baseNFTs.map((baseNFT) => {
      // add an entry to the map
      // with the baseNFT's id as the key
      // and all of the remixed NFTs as the value
      remixMapTemp.set(
        baseNFT.token_id,
        allNFTs.filter((nft) => nft.metadata?.parentId == baseNFT.metadata_url),
      );
    });

    console.log(remixMapTemp);
    return remixMapTemp;
  }

  // call out to NFTPort to get recipe nfts (only once)
  useEffect(() => {
    const options = {
      method: "GET",
      url: `https://api.nftport.xyz/v0/nfts/${ADDRESS}`,
      params: {
        chain: "rinkeby",
        include: "all",
        refresh_metadata: "true",
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: API_KEY,
      },
    };

    axios
      .request(options)
      .then((response) => {
        const responseBaseRecipes = response.data.nfts.filter(
          (nft) => nft.file_url && nft.metadata.parentId == BASE,
        );
        setBaseRecipes(responseBaseRecipes);
        setRemixMap(buildRemixMap(response.data.nfts, responseBaseRecipes));
      })
      .catch(function (error) {
        console.error(error);
      });
  }, []);

  const handleRemixClick = (nft) => {
    setNftToRemix(nft);
    form.resetFields();
    setModalVisibility(true);
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

    await contractProcessor
      .fetch({
        params: options,
      })
      .then(notifySuccess(tokenURI));
  }

  function notifySuccess(tokenURI) {
    console.log(`NFT has been minted with this metadata: ${tokenURI}`);
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
      parentId: nftToRemix ? nftToRemix.metadata_url : BASE,
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
    await mintNFT(nftFile.ipfs());
  }

  function clearForm() {
    form.resetFields();
    setNftToRemix(null);
    setModalVisibility(false);
  }

  const showDrawer = (nft) => {
    setNftToRemix(nft);
    setDrawerVisibility(true);
  };

  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <Tabs>
        <TabPane tab="Mint New Recipe" key="1">
          <h1>Mint a new NFT</h1>
          <div>
            <div>
              <NFTMintForm
                onUpload={uploadAction}
                onSubmit={submitForm}
                nft={{}}
                buttonText="Mint"
              />
            </div>
          </div>
        </TabPane>
        <TabPane tab="Remix a Recipe" key="2">
          <h1>Explore the Base Recipes</h1>
          <Skeleton loading={!baseRecipes}>
            <div style={styles.NFTs}>
              {baseRecipes &&
                baseRecipes.map((nft, index) => {
                  const actions = [
                    <Tooltip title="Remix this Recipe">
                      <RiseOutlined onClick={() => handleRemixClick(nft)} />
                    </Tooltip>,
                    <Button type="primary" onClick={() => showDrawer(nft)}>
                      Remixes
                    </Button>,
                  ];
                  //Verify Metadata
                  // nft = verifyMetadata(nft);
                  return (
                    <RecipeCard
                      recipe={nft}
                      index={index}
                      actions={actions}
                    ></RecipeCard>
                  );
                })}
            </div>
          </Skeleton>
          <Modal
            title={`Remix ${nftToRemix?.metadata?.name || "NFT"}`}
            visible={modalVisible}
            onCancel={() => clearForm()}
            footer={null}
          >
            <NFTMintForm
              onUpload={uploadAction}
              onSubmit={submitForm}
              nft={nftToRemix}
              form={form}
              buttonText="Remix"
            />
          </Modal>
          <Drawer
            title={`Remixes of ${nftToRemix?.metadata?.name}`}
            placement="right"
            onClose={() => {
              setDrawerVisibility(false);
            }}
            visible={drawerVisibile}
          >
            {remixMap?.get(nftToRemix?.token_id)?.map((nft, index) => {
              return <RecipeCard recipe={nft} index={index} />;
            })}
          </Drawer>
        </TabPane>
      </Tabs>
    </div>
  );
}

export default NFTMint;
