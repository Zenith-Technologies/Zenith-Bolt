import {readdir} from "fs/promises";
import {join} from "upath";

export class RecursiveReader {
    constructor(){}

    public static async read(dir: string): Promise<any[string]>{
        const files = await readdir(join(dir, ''), { withFileTypes: true } );

        const paths = files.map(async file => {
            const path = join(dir, file.name);

            if ( file.isDirectory() ) return await this.read( path );

            return path;
        });

        const filesRead = await Promise.all(paths);
        return filesRead.flat(Infinity);
    }
}