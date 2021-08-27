  /**
   * 動画の情報を取得してbackgroundへ投げる
   */
  let getInfo = (request, sender, sendResponse) => {
    let fanclub_ownername = document.querySelectorAll("strong.ng-binding")
    fanclub_ownername = fanclub_ownername[fanclub_ownername.length-1].textContent.split("さんを応援しよう")[0]
    let fanclub_name = document.querySelectorAll(".fanclub-name")
    fanclub_name = fanclub_name[0].textContent
    let posted_date = document.querySelector(".post-meta > small.post-date").textContent.match(/(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2})/)
    let year = posted_date[1]
    let month = posted_date[2]
    let day = posted_date[3]
    let hour = posted_date[4]
    let minute = posted_date[5]
    let post_title = document.querySelector("h1.post-title").textContent
    let post_id = location.href.split("/").pop()

    let file_number = request.downloadPath.split("/").pop()
    let post_content_title = ""
    let post_content_titles = document.querySelectorAll("h2.post-content-title")
    for (let i = 0; i < post_content_titles.length; i++) {
      if (post_content_titles[i].parentNode.id.indexOf(file_number) != -1) {
        post_content_title = post_content_titles[i].textContent
        break
      }
    }

    chrome.runtime.sendMessage({
      fanclub_ownername: fanclub_ownername,
      fanclub_name: fanclub_name,
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute,
      post_title: post_title,
      post_content_title: post_content_title,
      post_id: post_id,
      file_number: file_number,
    })
  }

/*
backgroundからのメッセージを受信したらgetInfoを実行
*/
chrome.runtime.onMessage.addListener(getInfo)