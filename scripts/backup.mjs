import {DatabaseSync,backup} from 'node:sqlite';
import {mkdirSync,existsSync,cpSync,writeFileSync,chmodSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
const database=resolve(process.env.DATABASE_PATH||'./data/evelin.sqlite');
if(!existsSync(database))throw new Error('Store database does not exist. Start the app before backing up.');
const root=resolve(process.env.BACKUP_PATH||'./backups');
const directory=join(root,'evelin-'+new Date().toISOString().replace(/[:.]/g,'-'));
mkdirSync(directory,{recursive:true,mode:0o700});
const db=new DatabaseSync(database,{readOnly:true});
try{await backup(db,join(directory,'evelin.sqlite'));}finally{db.close();}
chmodSync(join(directory,'evelin.sqlite'),0o600);
// Uploaded files are immutable and are written before their database references.
// Copying after the SQLite snapshot includes every image referenced by it.
const uploads=join(dirname(database),'uploads');
if(existsSync(uploads))cpSync(uploads,join(directory,'uploads'),{recursive:true,errorOnExist:true});
writeFileSync(join(directory,'README.txt'),'Evelin backup\nContains a consistent SQLite snapshot and uploaded product/banner photos.\nKeep SETTINGS_ENCRYPTION_KEY (or SESSION_SECRET when using fallback) separately in secure storage.\nStop the app before restoring this folder into its data volume. See project README.\n',{mode:0o600});
console.log(`Backup saved: ${directory}`);
