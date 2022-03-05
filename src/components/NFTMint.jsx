import React, { useState } from "react";
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
  const [nftTitle, setNFTTitle] = useState(null);

  async function mint(nft) {
    console.log(nft);
  }

  const handleMintClick = () => {
    const nft = {
      title: nftTitle,
    };
    mint(nft);
  };

  const handleChange = (e) => {
    setNFTTitle(e.target.value);
  };

  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <h1>Mint a new NFT</h1>
      <div style={styles.NFTs}>
        <div>
          <Input placeholder="nft title" onChange={(e) => handleChange(e)} />
          <Button onClick={(e) => handleMintClick(e)}>Mint!</Button>
        </div>
      </div>
    </div>
  );
}

export default NFTMint;
