module YTDownloader {

    export interface IMediaInfo    {
        link: string, 
        mode: string
    }

    export interface ILoginInfo    {
        username: string,
        password: string
    }

    export interface IControlLoginInfo  {
        isLogged: boolean, 
        offlineMode: boolean}
}