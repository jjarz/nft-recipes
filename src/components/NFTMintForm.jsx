import React from "react";

import { Input, Button, Form, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

function NFTMintForm(props) {
  const nft = props.nft;

  const uploadProps = {
    name: "logo",
    customRequest: props.onUpload,
    listType: "picture",
  };

  if (nft.file_url) {
    uploadProps.defaultFileList = [
      {
        name: nft.metadata?.name,
        status: "done",
        response: "Server Error 500", // custom error message to show
        url: nft.file_url,
      },
    ];
  }

  return (
    <Form
      form={props.form}
      name="nft form"
      onFinish={props.onSubmit}
      autoComplete="off"
    >
      <Form.Item
        label="Recipe Title"
        name="title"
        rules={[{ required: true, message: "Please input your recipe title" }]}
      >
        <Input defaultValue={nft.metadata?.name} />
      </Form.Item>
      <Form.Item
        label="Recipe Content"
        name="content"
        rules={[
          { required: true, message: "Please input your recipe content" },
        ]}
      >
        <Input.TextArea rows={6} defaultValue={nft.metadata?.content} />
      </Form.Item>

      <Form.Item
        name="imageFile"
        label="Recipe Image"
        valuePropName="imageFile"
        rules={[{ required: true, message: "Please upload a recipe image" }]}
      >
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>Click to upload</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Remix
        </Button>
      </Form.Item>
    </Form>
  );
}

export default NFTMintForm;
