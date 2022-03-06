import React from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi } from "../contracts/contractInfo.json";
import { Input, Button } from "antd";

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

function NFTMint() {
  // will use this eventually to set properties on the NFT (like title)
  // const [nftTitle, setNFTTitle] = useState(null);
  const { account } = useMoralis();

  /*
   * Based off of https://github.com/YosephKS/moralis-upgradeable-smart-contracts/blob/main/src/components/Home.jsx
   */
  const { runContractFunction, isLoading } = useWeb3Contract({
    functionName: "mint",
    abi,
    contractAddress: "0x2B3E48d8E94E225D35a18b97b881dcA2D828c375",
    params: {
      account,
      id: 0,
      amount: 1,
    },
  });

  // const handleChange = (e) => {
  //   setNFTTitle(e.target.value);
  // };

  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <h1>Mint a new NFT</h1>
      <div style={styles.NFTs}>
        <div>
          <Input placeholder="nft title" />
          <Button onClick={() => runContractFunction()} loading={isLoading}>
            Mint!
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NFTMint;
