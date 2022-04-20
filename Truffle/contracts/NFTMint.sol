// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMint is ERC721 {
    using Strings for uint256;
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Optional mapping for token URIs
    mapping (uint256 => string) private _tokenURIs;

    constructor()
        ERC721("RecipeNFT", "RCP"){

        }
    
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }
    
    // note: may want to add access control (https://docs.openzeppelin.com/contracts/3.x/access-control) to restrict to MINTER_ROLE 
    function mint(
        address _to,
        string memory tokenURI_
    ) public {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        
        _mint(_to, newItemId);
        _setTokenURI(newItemId, tokenURI_);
    }
}