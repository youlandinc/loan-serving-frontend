import { ColumnPiningDirectionEnum } from '@/types/enum';
import { SnapshotOut, types } from 'mobx-state-tree';

import { allLoansGridQueryModel } from '@/models/gridModel/allLoansModel/gridQueryModel';

export const orderColumnsItem = types.model({
  field: types.string,
  sort: types.number,
  visibility: types.boolean,
  headerName: types.string,
  id: types.number,
  columnWidth: types.maybeNull(types.number),
  hidden: types.maybe(types.boolean),
  pinType: types.maybeNull(
    types.enumeration(Object.values(ColumnPiningDirectionEnum)),
  ),
  disabled: types.maybe(types.boolean),
  leftOrder: types.maybeNull(types.number),
  rightOrder: types.maybeNull(types.number),
});

export type IOrderColumnsItem = SnapshotOut<typeof orderColumnsItem>;

export const allLoansModel = types
  .model({
    queryModel: allLoansGridQueryModel,
    orderColumns: types.array(orderColumnsItem),
  })
  .actions((self) => ({}));
