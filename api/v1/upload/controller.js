'use strict';

const { v7: uuidv7 } = require('uuid');
const utils = require('../../../utils/utils');
const rsMsg = require('../../../response/rs');
const logger = require('../../../config/logger');
const s3 = require('../../../config/oss').client;

exports.getListBucket = async function (req, res) {
  try {
    const upload = await s3.listBuckets().promise();

    return res.status(200).json(rsMsg('000000', upload))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error GET /api/v1/upload/list/bucket...', e);
  }
}

exports.uploadFileSingle = async function (req, res) {
  try {
    let file = req.body.file;
    let key = req.body.key;
    let buf = Buffer.from(file, 'base64')
    let filetype = await checkFiletipe(buf);
    let ext = filetype.ext;
    let mime = filetype.mime;

    let upload = await s3.upload({
      ACL: 'public-read',
      Bucket: 'bucket-sit',
      Key: `${key}.${ext}`,
      Body: buf,
      ContentEncoding: 'base64',
      ContentType: mime,
    }).promise();
    
    return res.status(200).json(rsMsg('000000', upload))
  } catch (e) {
    return utils.returnErrorFunction(res, 'error POST /api/v1/upload/upload-file-single...', e);
  }
};

async function checkFiletipe(buffer) {
  try {
    const { fileTypeFromBuffer } = await import('file-type');

    const type = await fileTypeFromBuffer(buffer);

    return type
  } catch (e) {
    return null
  }
}