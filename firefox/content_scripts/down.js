/**
 * 動画の情報を取得してbackgroundへ投げる
 */
let getInfo = (request, sender, sendResponse) => {
  let fanclub_ownername = document.querySelectorAll("strong.ng-binding")
  fanclub_ownername = fanclub_ownername[fanclub_ownername.length - 1].textContent.split("さんを応援しよう")[0]
  let fanclub_name = document.querySelectorAll(".fanclub-name")
  fanclub_name = fanclub_name[0].textContent
  let dt = Date.parse(document.querySelector(".post-meta > small.post-date").textContent)
  let post_date = new Date(dt)
  let year = post_date.getFullYear()
  let month = post_date.getMonth() + 1
  let day = post_date.getDate()
  let hour = post_date.getHours()
  let minute = post_date.getMinutes()
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
    year: year.toString(),
    month: month.toString().padStart(2, '0'),
    day: day.toString().padStart(2, '0'),
    hour: hour.toString().padStart(2, '0'),
    minute: minute.toString().padStart(2, '0'),
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
