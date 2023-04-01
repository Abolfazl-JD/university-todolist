export class UserResponse {
    /**
     * @example 6421ff2a0ca6af474c220104
     */
    _id: string
    /**
     * @example ali
     */
    username: string
    /**
     * @example ali@gmail.com
     */
    email: string
    /**
     * @example path_to_image
     */
    imagePath: string
    /**
     * @example false
     */
    emailIsConfirmed: boolean

    /**
     * @example 2023-03-27T20:40:10.857Z
     */
    createdAt: string

    /**
     * @example 2023-03-27T20:40:10.857Z
     */
    updatedAt: string
}