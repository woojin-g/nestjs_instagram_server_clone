export interface ResourceOwnerChecker {
  checkResourceOwner(resourceId: number, userId: number): Promise<boolean>;
}
