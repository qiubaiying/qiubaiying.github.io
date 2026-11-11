import test from 'node:test';
import assert from 'node:assert/strict';
import { wechatTextAlign } from '../public/wechat-style.js';

test('clipboard alignment uses only WeChat-compatible physical values', () => {
  assert.equal(wechatTextAlign('start'), 'left');
  assert.equal(wechatTextAlign('end'), 'right');
  assert.equal(wechatTextAlign('start', 'rtl'), 'right');
  assert.equal(wechatTextAlign('end', 'rtl'), 'left');
  for (const value of ['left', 'right', 'center', 'justify']) assert.equal(wechatTextAlign(value), value);
  assert.equal(wechatTextAlign('unknown'), 'left');
});
