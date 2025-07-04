/*Zapping Calendar V0.5 2025.07.01*/

/*Settings*/
const daily_notes_location = "Journal";
const daily_notes_format = "YYYY-MM-DD";
const daily_notes_template = "templater-obsidian:Config/Template/DailyNoteTemplate.md";
const weekly_notes_location = daily_notes_location;
const weekly_notes_format = "gggg-[W]ww";
const weekly_notes_template = "templater-obsidian:Config/Template/WeeklyNoteTemplate.md";

const ahead_week = 4;
const auto_detect_weekly = true;	//auto-detect calendar range by weekly notes

const open_with_newtab = true;
const create_daily_note = false;
const create_weekly_note = false;

const flag_tags = [" #Event-A"," #Event-B"," #Event-C"," #Event-D"," #Event-E"];

/* Defaults
const daily_notes_location = "Journal";
const daily_notes_format = "YYYY-MM-DD";
const daily_notes_template = "templater-obsidian:Config/Template/DailyNoteTemplate.md";
const weekly_notes_location = daily_notes_location;
const weekly_notes_format = "gggg-[W]ww";
const weekly_notes_template = "templater-obsidian:Config/Template/WeeklyNoteTemplate.md";

const ahead_week = 4;
const auto_detect_weekly = true;	//auto-detect calendar range by weekly notes

const open_with_newtab = true;
const create_daily_note = false;
const create_weekly_note = false;

const flag_tags = [" #Event-A"," #Event-B"," #Event-C"," #Event-D"," #Event-E"];
*/

const color_empty = "#f8f8f8";
const color_text_min = "#f2f0f4";
const color_text_max = "#10d010";
const color_task_min = "#ffffff";
const color_task_max = "#ffa0a0";

const count_dtext_min = 152;
const count_dtext_max = 1024;
const count_wtext_min = 400;
const count_wtext_max = 1024;
const count_task_min = 0;
const count_task_max = 12;

/*Global variables*/
let oldest_date = Date.now();
let newest_date = Date.now();

const count_dtext_len = count_dtext_max - count_dtext_min;
const count_wtext_len = count_wtext_max - count_wtext_min;
const count_task_len = count_task_max - count_task_min;
const todays_weekID = moment().format("gggg-[W]ww");

/*Utility Functions*/
function mix_hexcolor(col1, col2, k = 0.5){
	if(col1.length != 7 && col1.charAt(0) != "#")throw new Error("Parameter 1 is not a 6 digit hex code");
	if(col2.length != 7 && col2.charAt(0) != "#")throw new Error("Parameter 2 is not a 6 digit hex code");
	const r = Math.max(Math.min(Math.round(parseInt(col1.slice(1,3), 16) * (1 - k) + parseInt(col2.slice(1,3), 16) * k), 255), 0);
	const g = Math.max(Math.min(Math.round(parseInt(col1.slice(3,5), 16) * (1 - k) + parseInt(col2.slice(3,5), 16) * k), 255), 0);
	const b = Math.max(Math.min(Math.round(parseInt(col1.slice(5,7), 16) * (1 - k) + parseInt(col2.slice(5,7), 16) * k), 255), 0);
	return ("#" + r.toString(16).padStart(2,"0") + g.toString(16).padStart(2,"0") + b.toString(16).padStart(2,"0"))
}

function multi_hexcolor(col1, col2, k = 1.0){
	if(col1.length != 7 && col1.charAt(0) != "#")throw new Error("Parameter 1 is not a 6 digit hex code");
	if(col2.length != 7 && col2.charAt(0) != "#")throw new Error("Parameter 2 is not a 6 digit hex code");
	const r = Math.round(parseInt(col1.slice(1,3), 16) / 255 * (parseInt(col2.slice(1,3), 16) / 255 * k + (1 - k)) * 255);
	const g = Math.round(parseInt(col1.slice(3,5), 16) / 255 * (parseInt(col2.slice(3,5), 16) / 255 * k + (1 - k)) * 255);
	const b = Math.round(parseInt(col1.slice(5,7), 16) / 255 * (parseInt(col2.slice(5,7), 16) / 255 * k + (1 - k)) * 255);
	return ("#" + r.toString(16).padStart(2,"0") + g.toString(16).padStart(2,"0") + b.toString(16).padStart(2,"0"))
}

function dateID2path(strDate){
	//Format: YYYY-MM-DD
	return daily_notes_location + "/" + moment(strDate, "YYYY-MM-DD").format(daily_notes_format) + ".md";
}

function weekID2path(strWeek){
	//Format: gggg-[W]ww
	return weekly_notes_location + "/" + moment(strWeek, "gggg-[W]ww").format(weekly_notes_format) + ".md";
}

function convert_momentFormat2RegExp_str(strFormat){
	const re_ymd = new RegExp(/[yYMdDgwW]/g);
	let strFormat2 = "";

	strFormat = strFormat.replaceAll("/", "\/")
	for(const x of strFormat.split("[")){
		let y = x.split("]");
		if(y.length == 1){
			strFormat2 += y[0].replaceAll(re_ymd, "\\d");
		}else{
			strFormat2 += y[0];
			strFormat2 += y[1].replaceAll(re_ymd, "\\d");
		}
	}
	return strFormat2;
}

/*Functions*/
async function createDailyNote(date){
	fn = dateID2path(date);
	fd = fn.split("/").slice(0,-1).join("/");
	if(app.vault.getFolderByPath(fd) == null){
		await app.vault.createFolder(fd);
	}
	if(app.vault.getFileByPath(fn) == null){
		const tf = await app.vault.create(fn, "");
		if(open_with_newtab)app.workspace.getLeaf(true);
		await app.workspace.activeLeaf.openFile(tf);
		app.commands.executeCommandById(daily_notes_template);
	} else {
		if(open_with_newtab)app.workspace.getLeaf(true);
		app.workspace.activeLeaf.openFile(app.vault.getFileByPath(fn));
	}
}

async function createWeeklyNote(week){
	const fn = weekID2path(week);
	const fd = fn.split("/").slice(0,-1).join("/");
	if(app.vault.getFolderByPath(fd) == null){
		await app.vault.createFolder(fd);
	}
	if(app.vault.getFileByPath(fn) == null){
		const tf = await app.vault.create(fn, "");
		if(open_with_newtab)app.workspace.getLeaf(true);
		await app.workspace.activeLeaf.openFile(tf);
		app.commands.executeCommandById(weekly_notes_template);
	} else {
		if(open_with_newtab)app.workspace.getLeaf(true);
		app.workspace.activeLeaf.openFile(app.vault.getFileByPath(fn));
	}
}

function getAllFiles(tf, depth = 0){
	let files = [];
	if(depth > 512)throw new Error("Folder level is too deep");
	for(const [key, x] of Object.entries(tf.children)){
		if(x.hasOwnProperty('children')){
			//TFolder型の場合
			for(const y of getAllFiles(x, depth + 1))files.push(y);
		}else{
			//TFile型の場合
			files.push(x);
		}
	}
	return files;
}

function ButtonClick(elem){
	if (elem.target.type == "button"){
		let tmp_idx_local = -1;
		if(elem.target.id[5] === "W"){
			//weekly notes
			if(create_weekly_note){
				createWeeklyNote(elem.target.id);
			}else{
				tmp_idx_local = target_files.findIndex((el) => { return el.path === weekID2path(elem.target.id)});
				if(tmp_idx_local >= 0){
					if(open_with_newtab)app.workspace.getLeaf(true);
					app.workspace.activeLeaf.openFile(target_files[tmp_idx_local]);
				}
			}
		}else{
			//daily notes
			if(create_daily_note){
				createDailyNote(elem.target.id);
			}else{
				tmp_idx_local = target_files.findIndex((el) => { return el.path === dateID2path(elem.target.id)});
				if(tmp_idx_local >= 0){
					if(open_with_newtab)app.workspace.getLeaf(true);
					app.workspace.activeLeaf.openFile(target_files[tmp_idx_local]);
				}
			}
		}
	}
}

/*main*/
let target_folder = app.vault.getFolderByPath(daily_notes_location);	/*debug code*/
let target_files = getAllFiles(target_folder);

if (daily_notes_location != weekly_notes_location){
	target_files = target_files.concat(getAllFiles(app.vault.getFolderByPath(weekly_notes_location)))
}

/*入力欄の定義、フォーマットは必ず文字列で"yyyy-mm-dd"となる*/
const frm = dv.el("input");
frm.type = "date";
frm.id = "inputDate";

const btn_d = dv.el("button", "Open Daily Note");
btn_d.onclick = function(){
	if(frm.value){
		createDailyNote(frm.value);
	}
}

const btn_w = dv.el("button", "Open Weekly Note");
btn_w.onclick = function(){
	if(frm.value){
		createWeeklyNote(moment(frm.value, "YYYY-MM-DD").format("gggg-[W]ww"));
	}
}

const container = dv.el('div', '',  { cls: 'calendar_grid' });
let htmltext = "";
htmltext = `
<div>WEEK START</div>
<div>W</div>
<div></div>
<div>SUN</div>
<div></div>
<div></div>
<div>WED</div>
<div></div>
<div></div>
<div>SAT</div>
<div></div>
<div>Event</div>
`;

/*Generate RegExp match pattern*/
const re_daily = new RegExp(daily_notes_location + "\/" + convert_momentFormat2RegExp_str(daily_notes_format) + "\.md");
const re_weekly = new RegExp(weekly_notes_location + "\/" + convert_momentFormat2RegExp_str(weekly_notes_format) + "\.md");
const re_task = new RegExp(/- \[ \]|- \[.\]/g);
const re_flag = new RegExp(".*(" + flag_tags.join("|") + ")", "g");
let re_arflag = [];
for(x of flag_tags){
	re_arflag.push(new RegExp(x));
}


let count = 0;

/*Auto-detect calendar range*/
for(const x of target_files){
	if(re_daily.test(x.path)){
		//Daily note
		x.date = new Date(moment(x.path, "[" + daily_notes_location + "/]" + daily_notes_format + "[.md]").format("YYYY.MM.DD"));
		if(x.date > newest_date)newest_date = x.date;
		else if(x.date < oldest_date)oldest_date = x.date;
	}else if(re_weekly.test(x.path)){
		//Weekly note
		x.date = new Date(moment(x.path, "[" + weekly_notes_location + "/]" + weekly_notes_format + "[.md]").format("YYYY.MM.DD"));
		if(auto_detect_weekly){
			if(x.date > newest_date)newest_date = x.date;
			else if(x.date < oldest_date)oldest_date = x.date;
		}
	}
}

oldest_date.setDate(oldest_date.getDate() - oldest_date.getDay())

let tmp_date = new Date(newest_date);
tmp_date.setDate(tmp_date.getDate() - tmp_date.getDay() + 7 * ahead_week);	/*Set ahead of calendar range*/
//tmp_date = sunday

/*Draw Calendar*/
while(tmp_date >= oldest_date){
	const md = moment(tmp_date);
	const weekID = md.format("gggg-[W]ww");
	const tmp_filepath = weekID2path(weekID);
	const tmp_idx = target_files.findIndex((el) => { return el.path === tmp_filepath});
	let flag_cls = "";
	let ar_event_content = [];

	if(weekID === todays_weekID)htmltext += "<div><b>" + md.format("YYYY-MM-DD") + "</b></div>";
	else htmltext += "<div>" + md.format("YYYY-MM-DD") + "</div>";

	bgc = color_empty;
	if(tmp_idx >= 0){
		readObj = app.vault.cachedRead(target_files[tmp_idx]);
		await readObj.then(function (tmp_str) {
			bgc = multi_hexcolor(color_text_min, color_text_max, Math.min(Math.max((tmp_str.length - count_wtext_min)/count_wtext_len,0.0),1.0));
			const count_tasks = (tmp_str.match(re_task)|| []).length;
			bgc = multi_hexcolor(bgc, multi_hexcolor(color_task_min, color_task_max, Math.min(Math.max((count_tasks - count_task_min)/count_task_len,0.0),1.0)),0.8);
			const flag_match = tmp_str.match(re_flag);
			if(flag_match){
				let flag_i = 5;
				for(const x of flag_match){
					for(const [i,y] of re_arflag.entries()){
						if(y.test(x)){
							ar_event_content.push(x.replace(re_task,"").replace(y, ""));
							flag_i = Math.min(flag_i, i);
							break;
						}
					}
				}
				flag_cls = " flag" + (flag_i + 1);
			}
		});
	}else{
		if(!create_weekly_note)flag_cls = " empty";
	}
	htmltext += "<input type='button' class='calendar_button" + flag_cls + "' style='background-color:" + bgc + ";' id='" + weekID + "' value='W" + md.format("ww") + "'></input>";
	htmltext += "<div></div>";

	/*Draw Day*/
	for(let i = 0; i < 7; i++){
		let tmp_date2 = new Date(tmp_date)
		tmp_date2.setDate(tmp_date2.getDate() + i)

		const dateID = moment(tmp_date2).format("YYYY-MM-DD");
		let tmp_filepath2 = dateID2path(dateID);
		let tmp_idx2 = target_files.findIndex((el) => { return el.path === tmp_filepath2});
		let flag_cls2 = "";

		bgc = color_empty;
		if(tmp_idx2 >= 0){
			readObj = app.vault.cachedRead(target_files[tmp_idx2]);
			await readObj.then(function (tmp_str) {
				bgc = multi_hexcolor(color_text_min, color_text_max, Math.min(Math.max((tmp_str.length - count_dtext_min)/count_dtext_len,0.0),1.0));
				const count_tasks = (tmp_str.match(re_task)|| []).length;
				bgc = multi_hexcolor(bgc, multi_hexcolor(color_task_min, color_task_max, Math.min(Math.max((count_tasks - count_task_min)/count_task_len,0.0),1.0)),0.8);
				const flag_match = tmp_str.match(re_flag);
				if(flag_match){
					let flag_i = 5;
					for(const x of flag_match){
						for(const [i,y] of re_arflag.entries()){
							if(y.test(x)){
								ar_event_content.push(x.replace(re_task,"").replace(y, "") + "(" + dateID.slice(5).replace("-","/") + ")");
								flag_i = Math.min(flag_i, i);
								break;
							}
						}
					}
					flag_cls2 = " flag" + (flag_i + 1);
				}
			});
		}else{
			if(!create_daily_note)flag_cls2 = " empty";
		}
		htmltext += "<input type='button' class='calendar_button" + flag_cls2 + "' style='background-color:" + bgc + ";' id='" + dateID + "' value=''></input>"
	}

	if(weekID === todays_weekID)htmltext += "<div></div><div style='text-align:left'><b>" + ar_event_content.join(", ") + "</b></div>";
	else htmltext += "<div></div><div style='text-align:left'>" + ar_event_content.join(", ") + "</div>";
	tmp_date.setDate(tmp_date.getDate() - 7);
}
container.innerHTML = htmltext
container.addEventListener('click', ButtonClick);
