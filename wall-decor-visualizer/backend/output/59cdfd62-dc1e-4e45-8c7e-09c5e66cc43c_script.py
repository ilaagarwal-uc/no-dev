OUTPUT_PATH = '/tmp/59cdfd62-dc1e-4e45-8c7e-09c5e66cc43c.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions:
    - Total Height: 9'
    - Opening (Door/AC) Width: 7'
    - Opening (Door/AC) Height: 8'
    - Right Wall Section Width: 7'6" (7.5')
    - Lintel (Top gap) Height: 1'
    - Total Width: 14'6" (14.5')
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor from feet to meters (Blender default unit)
    ft_to_m = 0.3048
    wall_thickness = 0.15  # Standard wall thickness (~6 inches)

    # 1. Create the Right Wall Section
    # Dimensions: 7.5' wide, 9' high
    rw_w = 7.5 * ft_to_m
    rw_h = 9.0 * ft_to_m
    rw_d = wall_thickness
    # Position: Starts at x=7', so center is at 7 + 7.5/2 = 10.75'
    # Z center is at 9/2 = 4.5'
    bpy.ops.mesh.primitive_cube_add(
        size=1, 
        location=(10.75 * ft_to_m, 0, 4.5 * ft_to_m),
        scale=(rw_w, rw_d, rw_h)
    )
    rw_obj = bpy.context.active_object
    rw_obj.name = "Wall_Right_Section"

    # 2. Create the Lintel Section (the wall part above the door/AC opening)
    # Dimensions: 7' wide, 1' high
    l_w = 7.0 * ft_to_m
    l_h = 1.0 * ft_to_m
    l_d = wall_thickness
    # Position: Starts at x=0, z=8'. Center x=3.5', center z=8.5'
    bpy.ops.mesh.primitive_cube_add(
        size=1, 
        location=(3.5 * ft_to_m, 0, 8.5 * ft_to_m),
        scale=(l_w, l_d, l_h)
    )
    l_obj = bpy.context.active_object
    l_obj.name = "Wall_Lintel_Section"

    # Join the parts into a single skeleton object
    bpy.ops.object.select_all(action='DESELECT')
    rw_obj.select_set(True)
    l_obj.select_set(True)
    bpy.context.view_layer.objects.active = rw_obj
    bpy.ops.object.join()
    rw_obj.name = "Main_Wall_Skeleton"

    # Export the result to GLB format
    bpy.ops.export_scene.gltf(
        filepath='/tmp/59cdfd62-dc1e-4e45-8c7e-09c5e66cc43c.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()