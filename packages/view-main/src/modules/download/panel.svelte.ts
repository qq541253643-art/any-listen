export const downloadPanelState = $state({
  visible: false,
  musics: [] as AnyListen.Music.MusicInfoOnline[],
})

export const openDownloadPanel = (musics: AnyListen.Music.MusicInfo[] = []) => {
  downloadPanelState.musics = musics.filter((music): music is AnyListen.Music.MusicInfoOnline => !music.isLocal)
  downloadPanelState.visible = true
}
