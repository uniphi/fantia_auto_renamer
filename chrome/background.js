"use strict";
{
  let fileURL = ""
  let downloadPath = ""

  let downloadURL = requestDetails => {
    console.log("Loading: " + requestDetails.url)
    downloadPath = requestDetails.url
  }

  let redirectCancel = details => {
    for (let i = 0; i < details.responseHeaders.length; i++) {
      if (details.responseHeaders[i].name == "location") {
        fileURL = details.responseHeaders[i].value
        break
      }
    }
    // この時点ならDOMのロードは終わっているので情報が取れる
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { download: "clicked", downloadPath: downloadPath })
    })
    return { cancel: true }
  }

  /**
   * ダウンロードボタンのクリックを捕捉する
   */
  chrome.webRequest.onBeforeRequest.addListener(
    downloadURL,
    { urls: ["*://fantia.jp/posts/*/download/*"] },
    ["blocking"]
  )

  chrome.webRequest.onHeadersReceived.addListener(
    redirectCancel,
    { urls: ["*://fantia.jp/posts/*/download/*"] },
    ["blocking", "responseHeaders"]
  )

  let executeDownload = (info) => {
    chrome.storage.local.get({
      filename_definition: '?fanclub-ownername? - ?file-origin-name?'
    },(settings)=>{
      let file_origin_name = decodeURI(
        fileURL.split(/file\/\d+\/\w{9}/)[1].split("?Key-Pair")[0]
      )
      let extension = splitDotExt(file_origin_name)[1]
      file_origin_name = splitDotExt(file_origin_name)[0]
      let saved_dates = getDate(new Date())
      let filename = settings.filename_definition
        .replace(/\?fanclub-ownername\?/g, info.fanclub_ownername)
        .replace(/\?fanclub-name\?/g, info.fanclub_name)
        .replace(/\?file-origin-name\?/g, file_origin_name)
        .replace(/\?post-title\?/g, info.post_title)
        .replace(/\?post-content-title\?/g, info.post_content_title)
        .replace(/\?year\?/g, info.year)
        .replace(/\?month\?/g, info.month)
        .replace(/\?day\?/g, info.day)
        .replace(/\?hour\?/g, info.hour)
        .replace(/\?minute\?/g, info.minute)
        .replace(/\?saved-year\?/g, saved_dates.year)
        .replace(/\?saved-month\?/g, saved_dates.month)
        .replace(/\?saved-day\?/g, saved_dates.day)
        .replace(/\?saved-hour\?/g, saved_dates.hour)
        .replace(/\?saved-minute\?/g, saved_dates.minute)
        .replace(/\?post-id\?/g, info.post_id)
        .replace(/\?file-number\?/g, info.file_number)
      filename = convertSafeFileName(filename)
      filename += extension

      chrome.downloads.download({
        url: fileURL,
        filename: filename,
        conflictAction: "uniquify",
        saveAs: true
      })
    })
  }

    /*
  down.jsから動画情報を受け取ってダウンロードを開始する
  */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    executeDownload(request)
    sendResponse({})
    return true
  })

  /*
   *down.jsから動画情報を受け取ってダウンロードを開始する
   */
  // chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  //   let title = decodeURI(
  //     fileURL.split(/file\/\d+\/\w{9}/)[1].split("?Key-Pair")[0]
  //   );
  //   chrome.storage.local.get(["filename"], settings => {
  //     let filename = request.fanclub_ownername + " - " + title;
  //     if (typeof settings.filename !== "undefined") {
  //       if (settings.filename.indexOf("type1") != -1) {
  //         filename = request.fanclub_ownername + " - " + title;
  //       } else if (settings.filename.indexOf("type2") != -1) {
  //         filename = "[" + request.fanclub_ownername + "] " + title;
  //       } else {
  //         filename = title;
  //       }
  //     }

  //     chrome.downloads.download({
  //       url: fileURL,
  //       filename: filename,
  //       conflictAction: "uniquify",
  //       saveAs: true
  //     })
  //   })
  // })

  /* エラーログ */
  function onError(e) {
    console.error(e)
  }

  /**
   * ゼロパディングした日時を取得
   *
   * @param {Date} d 日付
   */
    let getDate = (d) => {
      return {
        'year': d.getFullYear().toString().padStart(4, '0'),
        'month': (d.getMonth()+1).toString().padStart(2, '0'),
        'day': d.getDate().toString().padStart(2, '0'),
        'hour': d.getHours().toString().padStart(2, '0'),
        'minute': d.getMinutes().toString().padStart(2, '0'),
      }
    }

    /*
  使用できない文字を全角に置き換え
  ¥　/　:　*　?　"　<　>　| tab
  chromeのみ
  半角チルダを全角チルダへ変換
  */
  let convertSafeFileName = (titleOrUsername) => {
    return unEscapeHTML(titleOrUsername)
      .replace(/\\/g,'￥')
      .replace(/\//g,'／')
      .replace(/:/g,'：')
      .replace(/\*/g,'＊')
      .replace(/\?/g,'？')
      .replace(/"/g,'”')
      .replace(/</g,'＜')
      .replace(/>/g,'＞')
      .replace(/\|/g,'｜')
      .replace(/\t/g, '　')
      .replace(/~/g,'～')
      .replace(/\./g,'．')
  }

  /**
   * HTMLアンエスケープ
   *
   * @param {String} str 変換したい文字列
   */
  let unEscapeHTML = (str) => {
    return str
      .replace(/(&lt;)/g, '<')
      .replace(/(&gt;)/g, '>')
      .replace(/(&quot;)/g, '"')
      .replace(/(&#39;)/g, "'")
      .replace(/(&amp;)/g, '&')
  }

  /**
   * 拡張子をドット付きで切り出す
   *
   * @param {String} str 文字列
   */
    let splitDotExt = (str) => {
      return str.split(/(?=\.[^.]+$)/)
    }
}
