import React from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
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

/*
 * interacting with smart contract code: https://youtu.be/7TKqLJd_aYI?t=677
 *
 */
function NFTMint() {
  // will use this eventually to set properties on the NFT (like title)
  // const [nftTitle, setNFTTitle] = useState(null);
  const { account } = useMoralis();
  const contractProcessor = useWeb3ExecuteFunction();

  // address _to,
  // uint256 _tokenId,
  // string memory tokenURI_
  async function mintNFT() {
    const options = {
      functionName: "mint",
      abi,
      contractAddress: "0x8BFdc18F1025edB30777aa2A5fd07A8f94A11142",
      params: {
        _to: account,
        tokenURI_:
          "https://ipfs.io/ipfs/QmbJWAESqCsf4RFCqEY7jecCashj8usXiyDNfKtZCwwzGb?filename=nft_metadata.json",
      },
    };

    await contractProcessor.fetch({
      params: options,
    });
  }

  // const handleChange = (e) => {
  //   setNFTTitle(e.target.value);
  // };

  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <h1>Mint a new NFT</h1>
      <div style={styles.NFTs}>
        <div>
          <Input placeholder="nft title" />
          <Button onClick={() => mintNFT()}>Mint!</Button>
        </div>
      </div>
    </div>
  );
}

export default NFTMint;
