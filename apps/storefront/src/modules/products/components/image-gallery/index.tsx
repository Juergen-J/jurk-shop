import { HttpTypes } from "@medusajs/types"
import { Container } from "@modules/common/components/ui"
import Image from "next/image"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import { getTranslations } from "next-intl/server"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  /** Photos were edited with AI: labelled on the image and below the gallery. */
  aiEdited?: boolean
}

const ImageGallery = async ({ images, aiEdited }: ImageGalleryProps) => {
  const t = await getTranslations("product")

  if (!images?.length) {
    return (
      <div className="hidden small:flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-brand/10 to-ui-bg-subtle text-brand/40">
        <PlaceholderImage size="64" />
      </div>
    )
  }

  return (
    <div className="flex items-start relative">
      <div className="flex flex-col flex-1 gap-y-4">
        {images.map((image, index) => {
          return (
            <Container
              key={image.id}
              className="relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle"
              id={image.id}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  priority={index <= 2 ? true : false}
                  className="absolute inset-0 rounded-rounded"
                  alt=""
                  fill
                  sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                  style={{
                    objectFit: "cover",
                  }}
                />
              )}
              {aiEdited && (
                <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                  {t("aiImagesBadge")}
                </span>
              )}
            </Container>
          )
        })}
        {aiEdited && (
          <p className="txt-compact-small text-ui-fg-subtle">
            {t("aiImagesNote")}
          </p>
        )}
      </div>
    </div>
  )
}

export default ImageGallery
