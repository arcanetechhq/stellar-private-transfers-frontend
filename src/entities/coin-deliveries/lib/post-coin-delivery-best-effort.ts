import type { AppDispatch } from "@/store";
import type { PostCoinDeliveryBody } from "../api/coin-delivery-api";
import { coinDeliveryApi } from "../api/coin-delivery-api";

export async function postCoinDeliveryBestEffort(
  dispatch: AppDispatch,
  buildBody: () => Promise<PostCoinDeliveryBody>,
): Promise<string | undefined> {
  try {
    const body = await buildBody();
    await dispatch(
      coinDeliveryApi.endpoints.postCoinDelivery.initiate(body),
    ).unwrap();
    return undefined;
  } catch (error: unknown) {
    return error instanceof Error ? error.message : "Coin-delivery POST failed";
  }
}
