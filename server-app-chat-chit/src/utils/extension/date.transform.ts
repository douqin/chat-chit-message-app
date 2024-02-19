export function dateMysqlToJS(date: string) {
    return new Date(Date.parse(date.replace(/-/g, '/')));
}
export function dateStrJSToMysql(date: string) {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
}
export function dateJSToMysql(date: Date) {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
}