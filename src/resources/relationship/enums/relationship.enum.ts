export enum RelationshipUser {
    NO_RELATIONSHIP = -1,
    /** user 1 wait reponse invite friend from user 2 */
    WAIT_RESPONSE_REQUEST_FRIEND = 0,
    
    FRIEND = 1,
    /** user 1 block user 2 */
    BLOCKED = 3,
    /** user 1 was blocked by user 2 */
    WAS_BLOCKED = 4,
    /** user 1 anb  user 2 */
    PARALELL_BLOCKED = 5
}