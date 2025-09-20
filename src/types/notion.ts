import { CollectionInstance } from 'notion-types';

export interface CustomCollectionInstance extends CollectionInstance {
  allBlockIds?: string[];
  collectionIds?: string[];
}
