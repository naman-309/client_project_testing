import ReactPlayer from "react-player";

export function VideoPlayer({ url }) {
    return (
        <div className="video-player">
            <ReactPlayer
                url={url}
                width="100%"
                height="100%"
                controls
                playing={false}
                config={{
                    file: { attributes: { controlsList: "nodownload" } },
                }}
            />
        </div>
    );
}

export default VideoPlayer;
