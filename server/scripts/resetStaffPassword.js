require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') });

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const readline = require('node:readline/promises');
const { StringDecoder } = require('node:string_decoder');
const User = require('../src/models/User');

function readHidden(prompt) {
  const stdin = process.stdin;
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    return Promise.reject(new Error('Run this command from an interactive terminal.'));
  }

  return new Promise((resolve, reject) => {
    let value = '';
    const decoder = new StringDecoder('utf8');
    const wasRaw = stdin.isRaw;

    const finish = (error) => {
      stdin.off('data', onData);
      stdin.off('end', onEnd);
      stdin.setRawMode(wasRaw);
      stdin.pause();
      process.stdout.write('\n');
      if (error) reject(error);
      else resolve(value);
    };

    const onEnd = () => finish(new Error('Input closed before completion.'));
    const onData = (buffer) => {
      for (const character of decoder.write(buffer)) {
        if (character === '\u0003') {
          finish(new Error('Cancelled.'));
          return;
        }
        if (character === '\r' || character === '\n') {
          finish();
          return;
        }
        if (character === '\u007f' || character === '\u0008') {
          value = Array.from(value).slice(0, -1).join('');
        } else if (character >= ' ') {
          value += character;
        }
      }
    };

    process.stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on('data', onData);
    stdin.once('end', onEnd);
  });
}

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured in server/.env or the environment.');
  }
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
    throw new Error('Run this command from an interactive terminal.');
  }

  const prompt = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const email = (await prompt.question('Admin/staff email: ')).trim().toLowerCase();
    if (!email) throw new Error('An email address is required.');

    let user;
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      user = await User.findOne({ email }).select('_id name email role isActive');
    } catch {
      throw new Error('Could not read the account from MongoDB. Check server/.env and network access.');
    }
    if (!user || !['admin', 'staff'].includes(user.role)) {
      throw new Error('No admin/staff account was found for that email.');
    }
    if (user.isActive === false) {
      throw new Error('This account is inactive. Activate it through the authorized admin workflow first.');
    }

    console.log(`\nTarget account: ${user.name} <${user.email}> (${user.role})`);
    const confirmation = await prompt.question('Type RESET to change only this account password: ');
    if (confirmation !== 'RESET') {
      console.log('No changes made.');
      return;
    }

    prompt.close();
    const password = await readHidden('New password (8-72 UTF-8 bytes; input hidden): ');
    const confirmationPassword = await readHidden('Confirm new password (input hidden): ');
    const passwordBytes = Buffer.byteLength(password, 'utf8');
    if (passwordBytes < 8 || passwordBytes > 72) {
      throw new Error('Password must be between 8 and 72 UTF-8 bytes.');
    }
    if (password !== confirmationPassword) {
      throw new Error('The passwords did not match.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let result;
    try {
      result = await User.updateOne(
        { _id: user._id, role: user.role, isActive: { $ne: false } },
        { $set: { password: passwordHash } }
      );
    } catch {
      throw new Error('Could not update the account password. No password change was confirmed.');
    }
    if (result.modifiedCount !== 1) {
      throw new Error('The account changed during this operation; no password was updated.');
    }

    console.log('Password updated for the selected account. Sign in with the new password.');
  } finally {
    prompt.close();
  }
}

run()
  .catch((error) => {
    console.error(`Password reset not completed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
