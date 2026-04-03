import type { AppDispatch } from "@/app/store";
import type { PostCoinDeliveryBody } from "@/entities/coin-deliveries";
import { addSeenTag, coinDeliveryApi } from "@/entities/coin-deliveries";

export async function postCoinDeliveryBestEffort(
  dispatch: AppDispatch,
  buildBody: () => Promise<PostCoinDeliveryBody>,
): Promise<string | undefined> {
  try {
    const body = await buildBody();
    const result = await dispatch(
      coinDeliveryApi.endpoints.postCoinDelivery.initiate(body),
    ).unwrap();
    const tagBytes = body.tagBase64;
    if (!result.duplicate && tagBytes.trim()) {
      dispatch(
        addSeenTag({ assetId: body.assetId, tagBase64: tagBytes.trim() }),
      );
    }
    return undefined;
  } catch (error: unknown) {
    return error instanceof Error ? error.message : "Coin-delivery POST failed";
  }
}
