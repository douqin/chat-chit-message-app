export enum RelationshipUser {
    NO_RELATIONSHIP = -1,
    /** user 1 wait reponse invite friend from user 2 */
    WAIT_RESPONSE_REQUEST_FRIEND = 0,
    //
    FRIEND = 1,
    /** user 1 block user 2 */
    BLOCKED = 3,
    /* user 1 block user 2 and user 2 block user 1*/
    TWO_WAY_BLOCK = 5,
    WAS_BLOCKED = 4,
}
